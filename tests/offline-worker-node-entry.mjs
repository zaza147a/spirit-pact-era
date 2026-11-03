// Node-only adapter for the real browser offline Worker. No game logic is copied.
import {parentPort} from 'node:worker_threads';

let rngSeed=0x9e3779b9;
function seededRandom(){
 rngSeed^=rngSeed<<13;rngSeed^=rngSeed>>>17;rngSeed^=rngSeed<<5;
 return (rngSeed>>>0)/4294967296;
}
const args=new URL(import.meta.url).searchParams;
rngSeed=(Number(args.get('seed'))>>>0)||0x9e3779b9;
Math.random=seededRandom;
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
