// Observational actual-combat matrix. No claims of optimal builds or fair
// progression investment; all players are synthetic fixed-IV SSS fixtures.
// Run with: node tests/spirit-live-balance-observation.mjs
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000,duration=60000,rows=[],seed=93217;
async function measure(job,level,pairKey){
 const player=highLevelSpiritPlayer({job,level,pairKey});
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed='+seed+'&clock='+epoch,import.meta.url),{type:'module'});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Worker timeout '+job+' '+level+' '+pairKey)),45000);
   worker.on('message',msg=>{
    if(msg.type==='result'){clearTimeout(timeout);resolve(msg.result);}
    if(msg.type==='error'){clearTimeout(timeout);reject(Error(msg.stack||msg.message));}
   });
   worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s&&d&&s.simulated>0,'missing real combat '+job+' '+level+' '+pairKey);
  assert.ok(d.total>=0&&d.other>=0&&Number.isFinite(d.total));
  const row={job,level,pairKey,simulatedMs:s.simulated,wallMs:Math.round(performance.now()-start),
   reason:s.reason,alive:result.player.hp>0,kills:s.kills,revives:s.revives||0,
   resonanceActivations:s.resonanceActivations||0,damage:d,
   actualHpDps:Math.round(d.total/(s.simulated/1000)*100)/100};
  console.log(JSON.stringify(row));
  return row;
 }finally{await worker.terminate();}
}
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])
 for(const pairKey of DUAL_FUSION_TYPES)rows.push(await measure(job,level,pairKey));
assert.equal(rows.length,84);
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const group=rows.filter(r=>r.level===level&&r.job===job);
 const ranked=[...group].sort((a,b)=>b.actualHpDps-a.actualHpDps);
 console.log(JSON.stringify({summary:true,level,job,scenarios:group.length,
  fullDuration:group.filter(r=>r.simulatedMs===duration).length,
  alive:group.filter(r=>r.alive).length,
  zeroResonance:group.filter(r=>r.resonanceActivations===0).length,
  meanActualHpDps:Math.round(group.reduce((n,r)=>n+r.actualHpDps,0)/group.length),
  topThree:ranked.slice(0,3).map(r=>({pairKey:r.pairKey,dps:r.actualHpDps,reason:r.reason})),
  bottomThree:ranked.slice(-3).map(r=>({pairKey:r.pairKey,dps:r.actualHpDps,reason:r.reason}))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,duration,seed,
 limitation:'Synthetic builds; effective HP DPS is capped by actual monster HP and includes encounter gaps, not a theoretical class DPS ranking.'}));
