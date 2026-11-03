import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';

const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed=99',import.meta.url),{type:'module'});
try{
 const result=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Offline Node Worker smoke timeout')),15000);
  worker.on('message',message=>{
   if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
   else if(message.type==='error'){clearTimeout(timeout);reject(Error(message.message));}
  });
  worker.on('error',error=>{clearTimeout(timeout);reject(error)});
  worker.postMessage({player:{offline:{enabled:false,at:1000},pets:[],hp:100},now:20000});
 });
 assert.equal(result.summary,null,'ineligible offline state must not simulate');
 assert.equal(result.player.offline.enabled,false,'worker must not mutate ineligible state');
 console.log('Offline Node Worker loads production game and returns ineligible state unchanged.');
}finally{
 await worker.terminate();
}
