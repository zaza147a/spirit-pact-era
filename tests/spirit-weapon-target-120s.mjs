// Read the user's verified best ten-job saves; replace only the selected
// weapon/offhand when testing an alternative weapon style.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {rollGear,affixRange,GEAR_BASE} from '../dist/loot.js';

const START=2000000000000,DURATION=120000,SEEDS=[471122,93217,81733];
const VARIANTS=[['rogue','rifle',false],['hunter','shortBow',false],['hunter','longBow',false],['hunter','crossbow',false],
 ['sage','oneStaff',true],['sage','spellFist',false],['performer','instrument',false]];
const rows=[];
for(const [job,weaponId,shield] of VARIANTS.filter(([job,id])=>!process.env.SPIRIT_JOB_FILTER||process.env.SPIRIT_JOB_FILTER===job).filter(([job,id])=>!process.env.SPIRIT_WEAPON_FILTER||process.env.SPIRIT_WEAPON_FILTER===id)){
 for(const seed of SEEDS){
  const p=legacyOptimalPlayer(job);
  if(p.gear.rightHand.id!==weaponId){
   const original=p.gear.rightHand;
   const gear=rollGear(weaponId,200,'mythic',()=>.5);
   gear.enhancement='SSS';
   // Same six-slot offensive stat intent, legal value range for the new weapon.
   gear.affixes=Object.fromEntries(Object.entries(original.affixes).map(([key,val])=>[key,
    ['atk','matk'].includes(key)?affixRange(key,gear.tier,gear.rarity,weaponId)[1]:val]));
   if(weaponId==='oneStaff'||weaponId==='spellFist'){
    delete gear.affixes.atk;
    gear.affixes.matk=affixRange('matk',gear.tier,gear.rarity,weaponId)[1];
   }
   p.gear.rightHand=gear;
  }
  if(shield){p.gear.leftHand=structuredClone(legacyOptimalPlayer('crusader').gear.leftHand);}
  else if(GEAR_BASE[weaponId].hands===2)p.gear.leftHand=null;
  p.location='dawnrift';p.offline={at:START,enabled:true};
  p.potionThresholds={playerHp:90,playerSp:90,petHp:90,petSp:90};
  assert.equal(p.dawnSigil,8);
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+START,import.meta.url),{type:'module',workerData:{seed}});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('timeout '+job+' '+weaponId)),90000);
    worker.on('message',message=>{
     if(message.type==='result'){clearTimeout(timer);resolve(message.result);}
     else if(message.type==='error'){clearTimeout(timer);reject(Error(message.message));}
    });worker.on('error',reject);worker.postMessage({player:p,now:START+DURATION});
   });
   const s=result.summary;
   rows.push({job,weaponId,seed,kills:s.kills,dps:Math.round(s.damage.total*1000/s.simulated),
    ownerDps:Math.round(s.damage.player*1000/s.simulated),petDps:Math.round((s.damage.pet1+s.damage.pet2)*1000/s.simulated),revives:s.revives||0});
  }finally{await worker.terminate();}
 }
 const group=rows.filter(row=>row.job===job&&row.weaponId===weaponId),avg=k=>group.reduce((sum,row)=>sum+row[k],0)/group.length;
 console.log(JSON.stringify({job,weaponId,meanDps:Math.round(avg('dps')),meanOwnerDps:Math.round(avg('ownerDps')),meanPetDps:Math.round(avg('petDps')),meanKills:Number(avg('kills').toFixed(2)),revives:avg('revives')}));
}
console.log(JSON.stringify({complete:true,rows},null,2));
