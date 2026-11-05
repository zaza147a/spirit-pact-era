// Isolate whether allocations, affixes or cards are responsible for lost field uptime.
import {Worker} from 'node:worker_threads';
import {offensiveComparisonPlayer} from './fixtures/spirit-ranking-offensive-player.mjs';
const start=2000000000000,job=process.env.SPIRIT_JOB_FILTER||'wizard';
const variants=[
  {id:'base',stats:false,affixes:false,bossCards:false},
  {id:'stats',stats:true,affixes:false,bossCards:false},
  {id:'affixes',stats:false,affixes:true,bossCards:false},
  {id:'cards',stats:false,affixes:false,bossCards:true},
  {id:'stats_affixes',stats:true,affixes:true,bossCards:false},
  {id:'stats_cards',stats:true,affixes:false,bossCards:true},
  {id:'all',stats:true,affixes:true,bossCards:true}
];
for(const opts of variants){
 const player=offensiveComparisonPlayer(job,opts);
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+start,import.meta.url),
  {type:'module',workerData:{seed:471122}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('timeout')),60000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    else if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timeout);reject(e);});
   worker.postMessage({player,now:start+120000});
  });
  const s=result.summary;
  console.log(JSON.stringify({job,variant:opts.id,kills:s.kills,dps:Math.round(s.damage.total*1000/s.simulated),
   revives:s.revives||0,elapsed:s.simulated/1000,attributes:player.attributes,
   playerHp:result.player.hp,bosses:s.bossesEncountered||0}));
 }finally{await worker.terminate();}
}
