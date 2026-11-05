// Production offline Worker: one-fused-pet Lv200 five-boss trial integration.
// Synthetic pre-cleared continuous checkpoint, not an ordinary first-time entry.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {rollGear} from '../dist/loot.js';
import {canonicalFusionKey} from '../dist/spirit-job-rules.js';

const epoch=2000000000000,minutes=Number(process.env.SPIRIT_TRIAL_MINUTES||20),duration=minutes*60000;
const pairKey='attack-magic+defense-support';

async function run(job,fusion){
 const p=highLevelSpiritPlayer({level:200,job,pairKey});
 if(process.env.SPIRIT_BUILD==='physical'&&job==='spiritCommander'){
  p.attributes.STR=p.attributes.STR+p.attributes.INT-1;
  p.attributes.INT=1;
 }
 const pet=p.pets.find(x=>canonicalFusionKey(x)===fusion);
 assert.ok(pet,'expected synthetic fusion '+fusion);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 p.gear.rightHand=rollGear('staffSword',200,'mythic',()=>.25);
 const gear=[...Object.values(p.gear).filter(Boolean),...Object.values(pet.gear).filter(Boolean)];
 for(const item of gear)item.enhancement='SSS';
 assert.equal(gear.length,13,'one owner set plus three pet slots');
 p.trialClears={...p.trialClears,worldroot:1};
 p.trialRun={map:'worldroot',index:0,nextAt:epoch+1000,continuous:true,round:2,stopAfterRound:true,
  checkpoint:{version:1,at:epoch,enemies:[],timers:{},jobSkillTimers:{},petSkillTimers:{},
   petEffects:{},classBuffs:{},casting:null,controlEffect:null,petShield:0,shield:0}};
 p.location='worldroot';p.offline={at:epoch,enabled:true};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed:20261105}});
 try{return await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error(`trial timeout ${job} ${fusion}`)),120000);
  worker.on('message',m=>{
   if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
   if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
  });
  worker.on('error',error=>{clearTimeout(timer);reject(error);});
  worker.postMessage({player:p,now:epoch+duration});
 });}finally{await worker.terminate();}
}

const rows=[];
for(const job of ['pactWarrior','spiritCommander'].filter(x=>!process.env.SPIRIT_JOB_FILTER||x===process.env.SPIRIT_JOB_FILTER))for(const fusion of ['attack-magic','defense-support'].filter(x=>!process.env.SPIRIT_FUSION_FILTER||x===process.env.SPIRIT_FUSION_FILTER)){
 const result=await run(job,fusion),s=result.summary;
 assert.ok(s?.simulated>0&&Number.isFinite(s.damage?.total));
 assert.equal(result.player.pets.length,1);
 assert.equal(s.spiritEnemyTargets?.pet2||0,0);
 const row={job,fusion,build:process.env.SPIRIT_BUILD||'baseline',simulatedMs:s.simulated,reason:s.reason,cleared:!!(s.trialRounds>0),
  kills:s.kills,actualDps:Math.round(s.damage.total/(s.simulated/1000)),
  revives:s.revives||0,alive:result.player.hp>0,petAlive:result.player.pets[0].hp>0,
  guardian:s.guardian||null,potions:s.potions||{},fatal:s.spiritFatal||null};
 rows.push(row);console.log(JSON.stringify(row));
}
console.log(JSON.stringify({summary:true,minutes,rows}));
