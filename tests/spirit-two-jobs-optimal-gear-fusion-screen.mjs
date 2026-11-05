// Screen six fusion species for both single-pet jobs using the user-provided
// legacy optimum's exact armor and pet gear values, not a synthesized armor algorithm.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {FUSION_TYPES,canonicalFusionKey} from '../dist/spirit-job-rules.js';
import {rollGear,GEAR_BASE,affixRange} from '../dist/loot.js';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';
import {petStats} from '../dist/catalog.js';
import {runtime} from './runtime31-helper.mjs';

const START=2000000000000,DURATION=Number(process.env.SPIRIT_DURATION_MS||120000);
const SEEDS=process.env.SPIRIT_FAST==='1'?[471122]:[471122,93217,81733];
const wizard=legacyOptimalPlayer('wizard');
const crusader=legacyOptimalPlayer('crusader');
const PRESETS={
 int_agi_luk:{STR:1,AGI:150,VIT:41,INT:150,DEX:2,LUK:100},
 str_agi_luk:{STR:150,AGI:150,VIT:41,INT:1,DEX:2,LUK:100},
 hybrid:{STR:150,AGI:90,VIT:23,INT:120,DEX:1,LUK:60}
};
async function spiritCandidate(job,fusion,preset){
 const other=FUSION_TYPES.find(x=>x!==fusion);
 const p=highLevelSpiritPlayer({job,level:210,pairKey:[fusion,other].sort().join('+'),allowBoss:true});
 const pet=p.pets.find(x=>canonicalFusionKey(x)===fusion);assert.ok(pet);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 p.attributes={...PRESETS[preset]};p.dawnSigil=8;
 assert.equal(Object.values(p.attributes).reduce((n,v)=>n+v-1,0),438);
 // The exact nonweapon armor and shield from the user's validated ten-class saves.
 p.gear=structuredClone(wizard.gear);
 p.gear.leftHand=structuredClone(crusader.gear.leftHand);
 const weapon=rollGear('staffSword',200,'mythic',()=>.5);
 weapon.enhancement='SSS';weapon.affixes={
  atk:affixRange('atk',weapon.tier,weapon.rarity,'staffSword')[1],
  matk:affixRange('matk',weapon.tier,weapon.rarity,'staffSword')[1],
  hit:affixRange('hit',weapon.tier,weapon.rarity,'staffSword')[1],
  INT:affixRange('INT',weapon.tier,weapon.rarity,'staffSword')[1],
  LUK:affixRange('LUK',weapon.tier,weapon.rarity,'staffSword')[1],
  aspdPct:affixRange('aspdPct',weapon.tier,weapon.rarity,'staffSword')[1]
 };
 assert.ok(GEAR_BASE.staffSword.jobs.includes(job));p.gear.rightHand=weapon;
 // Use the same max-rank companion gear from the saved attack/magic optimum.
 pet.gear=structuredClone(wizard.pets[0].gear);
 // Keep the skill slots produced for this specific fusion, not attack/magic slots.
 p.sockets={};
 for(const slot of Object.keys(SLOTS)){
  const preferred=[wizard.sockets[slot],crusader.sockets[slot]];
  const valid=id=>id&&CARDS[id]?.boss&&CARDS[id].map!=='dawnrift'&&
   CARDS[id].map!=='legacy'&&cardAllowedInSlot(CARDS[id],slot,job);
  const selected=preferred.find(valid)||Object.keys(CARDS).find(valid);
  assert.ok(selected,slot+' must have a legal boss card');p.sockets[slot]=selected;
 }
 p.location='dawnrift';p.offline={at:START,enabled:true};
 p.potionThresholds={playerHp:90,playerSp:90,petHp:90,petSp:90};
 const stats=petStats(pet);pet.hp=stats.hp;pet.sp=stats.sp;
 // The upstream synthetic fixture gives every new job 999999 HP/MP.
 // Remove that artificial advantage before benchmarking against real saves.
 const c=await runtime();c.api.setup(p,null);
 p.hp=c.api.stat('hp');p.mp=c.api.stat('mp');
 assert.ok(p.hp>0&&p.hp<999999,'initial HP must equal legal maximum');
 return p;
}
const jobs=['pactWarrior','spiritCommander'].filter(j=>!process.env.SPIRIT_JOB_FILTER||j===process.env.SPIRIT_JOB_FILTER);
const rows=[];
for(const job of jobs)for(const fusion of FUSION_TYPES.filter(f=>!process.env.SPIRIT_FUSION_FILTER||process.env.SPIRIT_FUSION_FILTER===f))for(const preset of ['int_agi_luk','str_agi_luk','hybrid'].filter(x=>!process.env.SPIRIT_PRESET_FILTER||process.env.SPIRIT_PRESET_FILTER===x)){
 for(const seed of SEEDS){
  const player=await spiritCandidate(job,fusion,preset);
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+START,import.meta.url),
   {type:'module',workerData:{seed}});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('timeout '+job+'/'+fusion+'/'+preset)),90000);
    worker.on('message',m=>{
     if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
     if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
    });worker.on('error',e=>{clearTimeout(timer);reject(e);});
    worker.postMessage({player,now:START+DURATION});
   });
   const s=result.summary;
   rows.push({job,fusion,preset,seed,kills:s.kills,
    dps:Math.round(s.damage.total*1000/s.simulated),
    revives:s.revives||0,bossEncounters:s.bossesEncountered||0,
    ownerDps:Math.round(s.damage.player*1000/s.simulated),
    petDps:Math.round((s.damage.pet1+s.damage.pet2)*1000/s.simulated)});
  }finally{await worker.terminate();}
 }
 console.log(JSON.stringify({progress:job,fusion,preset,meanKills:rows.filter(r=>r.job===job&&r.fusion===fusion&&r.preset===preset).reduce((n,r)=>n+r.kills,0)/SEEDS.length}));
}
const results=jobs.flatMap(job=>[...new Set(rows.filter(r=>r.job===job).map(r=>r.fusion))].flatMap(fusion=>[...new Set(rows.filter(r=>r.job===job&&r.fusion===fusion).map(r=>r.preset))].map(preset=>{
 const group=rows.filter(r=>r.job===job&&r.fusion===fusion&&r.preset===preset);
 const mean=k=>group.reduce((a,r)=>a+r[k],0)/group.length;
 return {job,fusion,preset,meanKills:Number(mean('kills').toFixed(2)),
  meanDps:Math.round(mean('dps')),revives:Number(mean('revives').toFixed(2)),
  bossEncounters:Number(mean('bossEncounters').toFixed(2))};
}))).sort((a,b)=>b.meanDps-a.meanDps);
console.log(JSON.stringify({complete:true,conditions:'User-supplied optimum armor + pet gear, 200 mythic SSS, level210 sigil8, one fusion, 90% potions, real Worker, three stat presets',
 seeds:SEEDS,durationSeconds:DURATION/1000,results,...(process.env.SPIRIT_REPORT_COMPACT==='1'?{}:{rows})},null,2));
