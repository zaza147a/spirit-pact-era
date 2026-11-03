import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {CLASSES,SLOTS} from '../dist/catalog.js';

const start=2000000000000,duration=12000;
const slots=Object.fromEntries(Object.keys(SLOTS).map(slot=>[slot,null]));
const player={
 version:51,name:'DualTest',job:'spiritist',location:'petland',
 level:1,xp:0,jobLevel:1,jobXp:0,jobPoints:0,statPoints:0,
 hp:CLASSES.spiritist.hp,mp:CLASSES.spiritist.mp,
 gold:90,kills:0,cardRecyclePoints:0,
 bag:[],gear:slots,attributes:{STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1},
 sockets:structuredClone(slots),cards:[],pets:[],
 activePetId:null,secondaryPetId:null,petBook:{},resonance:0,shield:0,
 battleHistory:[],autoUltimate:false,autoPotions:{playerHp:false,playerSp:false,petHp:false,petSp:false},
 offline:{enabled:true,at:start}
};
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
