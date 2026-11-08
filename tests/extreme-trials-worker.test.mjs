import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {beginExtremeRun} from '../dist/extreme-trials.js';

const epoch=1000000;
const workerUrl=pathToFileURL(fileURLToPath(new URL('../dist/offline-worker.js',import.meta.url))).href;
function workerSession(){
 const source=`const {parentPort}=require('node:worker_threads');
 globalThis.self={postMessage:message=>parentPort.postMessage(message)};
 parentPort.on('message',data=>self.onmessage({data}));
 import(${JSON.stringify(workerUrl)}).then(()=>parentPort.postMessage({type:'ready'})).catch(error=>parentPort.postMessage({type:'error',message:String(error)}));`;
 return new Worker(source,{eval:true});
}
async function runWorker(player,now){
 const worker=workerSession();
 try{return await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('離線 Worker 超時')),15000);
  worker.on('message',message=>{
   if(message.type==='ready')worker.postMessage({player,now});
   else if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
   else if(message.type==='error'){clearTimeout(timeout);reject(Error(message.message));}
  });
  worker.on('error',error=>{clearTimeout(timeout);reject(error);});
 });}finally{await worker.terminate();}
}
function prepared(c,kind,floor){
 const player=legacyOptimalPlayer('knight');
 player.location='dawncity';
 if(floor>1)player.extremeProgress={[kind]:{highest:floor}};
 player.extremeRun=beginExtremeRun(player,kind,floor,epoch).run;
 assert.ok(player.extremeRun);
 player.location='dawnrift';player.offline={at:epoch,enabled:true};
 c.api.setup(player);c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 return player;
}

test('真正離線 Worker 載入遊戲模組，從 checkpoint 通關並回傳角色結果',async()=>{
 const c=await runtime(),initial=prepared(c,'atk',1);
 const result=await runWorker(initial,epoch+20500);
 assert.equal(result.summary.extremeFloors,1);
 assert.equal(result.player.extremeRun.floor,2);
 assert.equal(result.player.extremeProgress.atk.highest,1);
 assert.equal(result.player.extremeCoins,10);
 assert.equal(result.player.location,'dawnrift');
 assert.equal(result.summary.gold,0);
});

test('真正離線 Worker 傷害不足時停止，不多給後續階段獎勵',async()=>{
 const c=await runtime(),initial=prepared(c,'hp',50);
 initial.extremeProgress.hp.highest=49;
 const result=await runWorker(initial,epoch+31000);
 assert.match(result.summary.reason,/階段傷害不足/);
 assert.equal(result.player.extremeRun,undefined);
 assert.equal(result.player.extremeProgress.hp.highest,49);
 assert.equal(result.player.location,'dawncity');
});
