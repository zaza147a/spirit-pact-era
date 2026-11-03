import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {starterPlayer} from './fixtures/starter-player.mjs';

const start=2000000000000,duration=12000;
const player=starterPlayer();
const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed=4401',import.meta.url),{type:'module'});
try{
 const result=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Combat smoke timeout')),20000);
  worker.on('message',message=>{
   if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
   else if(message.type==='error'){clearTimeout(timeout);reject(Error(message.message));}
  });
  worker.on('error',error=>{clearTimeout(timeout);reject(error)});
  worker.postMessage({player,now:start+duration});
 });
 assert.ok(result.summary,'eligible character should receive offline summary');
 assert.ok(result.summary.simulated>0&&result.summary.simulated<=duration,'must simulate combat time');
 assert.ok(result.player&&Array.isArray(result.player.bag),'must return normal player data');
 console.log('Short real combat Worker simulation passed: '+result.summary.simulated+' ms, '+result.summary.kills+' kills.');
}finally{
 await worker.terminate();
}
