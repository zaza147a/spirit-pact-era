// Node-only adapter for the real browser offline Worker. No game logic is copied.
import {parentPort,workerData} from 'node:worker_threads';

let rngSeed=0x9e3779b9;
function seededRandom(){
 rngSeed^=rngSeed<<13;rngSeed^=rngSeed>>>17;rngSeed^=rngSeed<<5;
 return (rngSeed>>>0)/4294967296;
}
const args=new URL(import.meta.url).searchParams;
rngSeed=(Number(workerData?.seed??args.get('seed'))>>>0)||0x9e3779b9;
// Optional test-only proof: snapshot first PRNG value without consuming combat RNG.
if(workerData?.seedProof===true||args.has('seedProof')){
 const before=rngSeed,firstSample=seededRandom();rngSeed=before;
 parentPort.postMessage({type:'seed-proof',seed:rngSeed,firstSample});
}
// Real loot IDs include Date.now(). Freeze it only for benchmark workers,
// never in the browser production Worker or ordinary smoke tests.
if(args.has('clock')){
 const fixed=Number(args.get('clock'));
 if(!Number.isFinite(fixed)||fixed<=0)throw Error('Invalid benchmark clock');
 Date.now=()=>fixed;
}
Math.random=seededRandom;
globalThis.__spiritBenchmarkStack=true;
globalThis.__spiritDisablePetStatsCache=workerData?.disablePetStatsCache===true;
globalThis.__spiritDisableOfflineAffixCache=workerData?.disableOfflineAffixCache===true;
globalThis.self={
 postMessage(message){
  parentPort.postMessage(message.type==='result'
   ? {...message,workerHeapUsed:process.memoryUsage().heapUsed}
   : message);
 }
};
await import('../dist/offline-worker.js');
if(typeof self.onmessage!=='function')throw Error('Offline worker did not register onmessage');
parentPort.on('message',data=>self.onmessage({data}));
