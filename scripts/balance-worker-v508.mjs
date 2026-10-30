import {parentPort} from 'node:worker_threads';
import {runBuild} from './balance-v24.mjs';
parentPort.on('message',({index,job,role,options})=>{
 try{parentPort.postMessage({index,result:{...runBuild(job,role,options),seed:options.seed}});}
 catch(error){parentPort.postMessage({index,error:error.stack||String(error)});}
});
